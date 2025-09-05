# ☸️ Kubernetes Guide for E-commerce Platform

This guide explains how to deploy and manage our e-commerce platform using Kubernetes.

## 🎯 What is Kubernetes?

Kubernetes is like **"the conductor of an orchestra"**:

- **Docker Containers** = Individual musicians
- **Kubernetes** = The conductor who coordinates everyone
- **Result** = Beautiful, synchronized performance! 🎵

### Real-World Analogy: Air Traffic Control
- **Before Kubernetes**: Each plane (container) flies independently
- **With Kubernetes**: Air traffic control coordinates all flights
- **Result**: Safe, efficient, scalable air traffic system

## 🏗️ Kubernetes Concepts

### 1. **Pod** = The Smallest Unit
Think of it like a **"room in a hotel"**:
- Contains one or more containers
- Shares storage and network
- Lives and dies together

### 2. **Deployment** = The Manager
Think of it like a **"hotel manager"**:
- Manages multiple rooms (pods)
- Handles scaling up/down
- Ensures desired state

### 3. **Service** = The Reception Desk
Think of it like a **"hotel reception"**:
- Provides stable address for pods
- Load balances traffic
- Handles service discovery

### 4. **Ingress** = The Main Entrance
Think of it like a **"hotel lobby"**:
- Routes external traffic
- Handles SSL termination
- Manages external access

## 🚀 Quick Start

### Prerequisites
- Docker installed
- Kubernetes cluster (minikube, kind, or cloud)
- kubectl installed

### 1. Set Up Local Kubernetes Cluster

#### Option A: Minikube (Recommended for learning)
```bash
# Install minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start minikube
minikube start

# Enable ingress addon
minikube addons enable ingress

# Check status
minikube status
```

#### Option B: Kind (Kubernetes in Docker)
```bash
# Install kind
curl -Lo kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x kind
sudo mv kind /usr/local/bin/

# Create cluster
kind create cluster --name ecommerce

# Check status
kubectl cluster-info
```

### 2. Build and Load Docker Images

```bash
# Build Docker images
docker-compose build

# Load images into minikube
minikube image load ecommerce-user-service:latest
minikube image load ecommerce-product-service:latest
minikube image load ecommerce-order-service:latest
minikube image load ecommerce-notification-service:latest

# Or for kind
kind load docker-image ecommerce-user-service:latest --name ecommerce
kind load docker-image ecommerce-product-service:latest --name ecommerce
kind load docker-image ecommerce-order-service:latest --name ecommerce
kind load docker-image ecommerce-notification-service:latest --name ecommerce
```

### 3. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f kubernetes/namespace.yaml

# Deploy all services
kubectl apply -f kubernetes/user-service/
kubectl apply -f kubernetes/product-service/
kubectl apply -f kubernetes/order-service/
kubectl apply -f kubernetes/notification-service/

# Deploy ingress
kubectl apply -f kubernetes/ingress.yaml
```

### 4. Check Deployment Status

```bash
# Check pods
kubectl get pods -n ecommerce

# Check services
kubectl get services -n ecommerce

# Check ingress
kubectl get ingress -n ecommerce

# Check all resources
kubectl get all -n ecommerce
```

## 🔧 Kubernetes Commands Reference

### Basic Operations
```bash
# Get all resources
kubectl get all -n ecommerce

# Get specific resource
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
kubectl get deployments -n ecommerce

# Describe resource
kubectl describe pod <pod-name> -n ecommerce
kubectl describe service <service-name> -n ecommerce

# Get logs
kubectl logs <pod-name> -n ecommerce
kubectl logs -f <pod-name> -n ecommerce  # Follow logs

# Execute command in pod
kubectl exec -it <pod-name> -n ecommerce -- /bin/sh
```

### Scaling Operations
```bash
# Scale deployment
kubectl scale deployment user-service --replicas=3 -n ecommerce

# Auto-scale based on CPU
kubectl autoscale deployment user-service --cpu-percent=50 --min=2 --max=10 -n ecommerce

# Check horizontal pod autoscaler
kubectl get hpa -n ecommerce
```

### Rolling Updates
```bash
# Update image
kubectl set image deployment/user-service user-service=ecommerce-user-service:v2 -n ecommerce

# Check rollout status
kubectl rollout status deployment/user-service -n ecommerce

# Rollback deployment
kubectl rollout undo deployment/user-service -n ecommerce

# Check rollout history
kubectl rollout history deployment/user-service -n ecommerce
```

### Debugging
```bash
# Check pod events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'

# Check pod status
kubectl get pods -n ecommerce -o wide

# Check resource usage
kubectl top pods -n ecommerce
kubectl top nodes

# Port forward for testing
kubectl port-forward service/user-service 3002:3002 -n ecommerce
```

## 📊 Service Architecture

### Kubernetes Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  User Service   │  │ Product Service │                  │
│  │  Pods: 2        │  │  Pods: 2        │                  │
│  │  Service: 3002  │  │  Service: 3001  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Order Service  │  │Notification Svc │                  │
│  │  Pods: 2        │  │  Pods: 2        │                  │
│  │  Service: 3003  │  │  Service: 3004  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Ingress Controller                       │ │
│  │              (External Access)                          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Service Communication
- **Internal**: Services communicate via service names
- **External**: Access via Ingress controller
- **Load Balancing**: Automatic load balancing across pods
- **Service Discovery**: DNS-based service discovery

## 🧪 Testing Kubernetes Deployment

### 1. Check Service Health
```bash
# Port forward to test services
kubectl port-forward service/user-service 3002:3002 -n ecommerce &
kubectl port-forward service/product-service 3001:3001 -n ecommerce &
kubectl port-forward service/order-service 3003:3003 -n ecommerce &
kubectl port-forward service/notification-service 3004:3004 -n ecommerce &

# Test health endpoints
curl http://localhost:3002/health
curl http://localhost:3001/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

### 2. Test Through Ingress
```bash
# Get ingress IP
kubectl get ingress -n ecommerce

# Add to /etc/hosts (Linux/Mac)
echo "$(minikube ip) ecommerce.local" | sudo tee -a /etc/hosts

# Test through ingress
curl http://ecommerce.local/health
curl http://ecommerce.local/api/products
curl http://ecommerce.local/api/users/register -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

### 3. Run Complete Platform Demo
```bash
# Update demo script to use ingress
# Edit demo-complete-platform.js to use ecommerce.local instead of localhost

# Run demo
node demo-complete-platform.js
```

## 🔍 Monitoring and Observability

### Health Checks
```bash
# Check pod health
kubectl get pods -n ecommerce

# Check pod logs
kubectl logs -l app=user-service -n ecommerce

# Check pod events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

### Resource Monitoring
```bash
# Check resource usage
kubectl top pods -n ecommerce
kubectl top nodes

# Check resource limits
kubectl describe pods -n ecommerce
```

### Scaling Events
```bash
# Check horizontal pod autoscaler
kubectl get hpa -n ecommerce

# Check scaling events
kubectl describe hpa -n ecommerce
```

## 🚀 Production Considerations

### Security
- **Network Policies**: Restrict pod-to-pod communication
- **RBAC**: Role-based access control
- **Secrets**: Store sensitive data securely
- **Pod Security Standards**: Enforce security policies

### High Availability
- **Multi-zone Deployment**: Deploy across availability zones
- **Pod Disruption Budgets**: Ensure minimum pod availability
- **Resource Limits**: Prevent resource exhaustion
- **Health Checks**: Automatic pod replacement

### Monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Log aggregation
- **Alerting**: Proactive issue detection

## 🔧 Troubleshooting

### Common Issues

#### 1. **Pods Not Starting**
```bash
# Check pod status
kubectl get pods -n ecommerce

# Check pod logs
kubectl logs <pod-name> -n ecommerce

# Check pod events
kubectl describe pod <pod-name> -n ecommerce
```

#### 2. **Services Not Accessible**
```bash
# Check service endpoints
kubectl get endpoints -n ecommerce

# Check service selector
kubectl get service <service-name> -n ecommerce -o yaml

# Test service connectivity
kubectl exec -it <pod-name> -n ecommerce -- curl http://<service-name>:<port>/health
```

#### 3. **Ingress Not Working**
```bash
# Check ingress status
kubectl get ingress -n ecommerce

# Check ingress controller
kubectl get pods -n kube-system | grep ingress

# Check ingress logs
kubectl logs -n kube-system -l app.kubernetes.io/name=ingress-nginx
```

#### 4. **Image Pull Errors**
```bash
# Check image availability
kubectl describe pod <pod-name> -n ecommerce

# Load image into cluster
minikube image load <image-name>:<tag>
# or
kind load docker-image <image-name>:<tag> --name <cluster-name>
```

### Debug Commands
```bash
# Get all resources with labels
kubectl get all -n ecommerce --show-labels

# Check resource quotas
kubectl get resourcequota -n ecommerce

# Check persistent volumes
kubectl get pv,pvc -n ecommerce

# Check network policies
kubectl get networkpolicy -n ecommerce
```

## 🎯 Next Steps

Once you're comfortable with Kubernetes:

1. **Helm Charts**: Package management for Kubernetes
2. **Operators**: Custom resource management
3. **Service Mesh**: Advanced networking (Istio)
4. **GitOps**: Declarative deployment (ArgoCD)
5. **Cloud Deployment**: Deploy to managed Kubernetes

## 🎉 Congratulations!

You now know how to:
- ✅ Deploy microservices to Kubernetes
- ✅ Manage container orchestration
- ✅ Implement health checks and monitoring
- ✅ Scale applications horizontally
- ✅ Handle rolling updates
- ✅ Debug Kubernetes applications

This is exactly what companies like Netflix, Uber, and Amazon use to run their microservices at scale! 🚀

---

*This Kubernetes setup makes your e-commerce platform production-ready, scalable, and highly available.*
