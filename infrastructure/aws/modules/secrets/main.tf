# AWS Secrets Module
# This module creates Secrets Manager and manages secrets (Free tier)

# Create Secrets Manager Secret (Free tier)
resource "aws_secretsmanager_secret" "main" {
  name                    = "${var.project_name}-secrets"
  description             = "Secrets for ${var.project_name} application"
  recovery_window_in_days = 7  # Free tier allows 7 days

  tags = var.tags
}

# Store database connection string
resource "aws_secretsmanager_secret_version" "database_connection" {
  secret_id = aws_secretsmanager_secret.main.id
  secret_string = jsonencode({
    database_connection_string = var.database_connection_string
  })
}

# Store JWT secret
resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id = aws_secretsmanager_secret.main.id
  secret_string = jsonencode({
    jwt_secret = var.jwt_secret
  })
}

# Store email configuration
resource "aws_secretsmanager_secret_version" "email_config" {
  secret_id = aws_secretsmanager_secret.main.id
  secret_string = jsonencode(var.email_config)
}

# Create IAM policy for EKS to access secrets
resource "aws_iam_policy" "secrets_access" {
  name        = "${var.project_name}-secrets-access"
  description = "Policy for EKS to access secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.main.arn
      }
    ]
  })

  tags = var.tags
}

# Attach policy to EKS node group role
resource "aws_iam_role_policy_attachment" "secrets_access" {
  role       = var.eks_node_role_name
  policy_arn = aws_iam_policy.secrets_access.arn
}
