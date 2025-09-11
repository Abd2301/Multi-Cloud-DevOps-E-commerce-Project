# Outputs for AWS Infrastructure
# This file defines the outputs that will be displayed after successful deployment

# Network Module Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.network.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.network.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.network.private_subnet_ids
}

# EKS Cluster Outputs
output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.ecommerce.name
}

output "eks_cluster_arn" {
  description = "ARN of the EKS cluster"
  value       = aws_eks_cluster.ecommerce.arn
}

output "eks_cluster_endpoint" {
  description = "Endpoint for the EKS cluster"
  value       = aws_eks_cluster.ecommerce.endpoint
}

output "eks_cluster_version" {
  description = "Kubernetes version of the EKS cluster"
  value       = aws_eks_cluster.ecommerce.version
}

output "eks_cluster_security_group_id" {
  description = "Security group ID of the EKS cluster"
  value       = aws_eks_cluster.ecommerce.vpc_config[0].cluster_security_group_id
}

# EKS Node Group Outputs
output "eks_node_group_arn" {
  description = "ARN of the EKS node group"
  value       = aws_eks_node_group.ecommerce.arn
}

output "eks_node_group_status" {
  description = "Status of the EKS node group"
  value       = aws_eks_node_group.ecommerce.status
}

output "eks_node_group_capacity_type" {
  description = "Capacity type of the EKS node group"
  value       = aws_eks_node_group.ecommerce.capacity_type
}

# ECR Repository Outputs
output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    user_service         = aws_ecr_repository.user_service.repository_url
    product_service      = aws_ecr_repository.product_service.repository_url
    order_service        = aws_ecr_repository.order_service.repository_url
    notification_service = aws_ecr_repository.notification_service.repository_url
  }
}

output "ecr_registry_id" {
  description = "Registry ID for ECR"
  value       = data.aws_caller_identity.current.account_id
}

# Kubernetes Namespace Output
output "kubernetes_namespace" {
  description = "Name of the Kubernetes namespace"
  value       = kubernetes_namespace.ecommerce.metadata[0].name
}

# Connection Information
output "kubectl_config_command" {
  description = "Command to configure kubectl for the EKS cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.ecommerce.name}"
}

output "docker_login_command" {
  description = "Command to login to ECR"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

# Deployment Instructions
output "deployment_instructions" {
  description = "Instructions for deploying the application"
  value       = <<-EOT
    To deploy your e-commerce platform:
    
    1. Configure kubectl:
       aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.ecommerce.name}
    
    2. Login to ECR:
       aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com
    
    3. Build and push images:
       docker build -t ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.ecr_repository_name}/user-service:latest ./apps/user-service/
       docker push ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.ecr_repository_name}/user-service:latest
       # Repeat for other services...
    
    4. Deploy to Kubernetes:
       kubectl apply -f kubernetes/
    
    5. Check deployment:
       kubectl get pods -n ${kubernetes_namespace.ecommerce.metadata[0].name}
  EOT
}

# Cost Information
output "cost_optimization_tips" {
  description = "Tips for cost optimization"
  value       = <<-EOT
    Cost Optimization Tips:
    
    1. Use Spot Instances for non-production workloads
    2. Enable cluster autoscaler to scale down when not needed
    3. Use smaller instance types for development
    4. Monitor costs with AWS Cost Explorer
    5. Set up billing alerts
    6. Delete resources when not in use
    
    Current Configuration:
    - Instance Type: ${var.node_instance_type}
    - Node Count: ${var.node_count}
    - Region: ${var.aws_region}
  EOT
}
