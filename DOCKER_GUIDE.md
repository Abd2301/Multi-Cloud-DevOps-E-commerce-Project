# 🐳 Docker Guide for E-commerce Platform

This guide explains how to containerize and run our e-commerce platform using Docker.

## 🎯 What is Docker?

Docker is like **"shipping containers for software"**:

- **Traditional Deployment**: "It works on my machine!" 😅
- **Docker Deployment**: "It works everywhere!" ✅

### Real-World Analogy
- **Shipping Containers**: Standardized containers fit on any ship, truck, or train
- **Docker Containers**: Standardized containers run on any laptop, server, or cloud

## 🏗️ Docker Concepts

### 1. **Docker Image** = Recipe
- Contains all ingredients (code, dependencies, OS)
- Can be shared and reused
- Always produces the same result

### 2. **Docker Container** = The Actual Cake
- Running instance of the image
- Isolated environment
- Can be started, stopped, deleted

### 3. **Dockerfile** = Recipe Instructions
- Step-by-step instructions to build the image
- Like a cooking recipe for your app

### 4. **Docker Compose** = Restaurant Menu
- Orchestrates multiple containers
- Like ordering multiple dishes that work together

## 🚀 Quick Start

### Prerequisites
- Docker installed on your system
- Docker Compose installed

### 1. Build and Run All Services
```bash
# Build and start all services
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d --build
```

### 2. Check Service Status
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs user-service
```

### 3. Test the Platform
```bash
# Test health endpoint
curl http://localhost/health

# Test individual services
curl http://localhost:3001/health  # Product Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Order Service
curl http://localhost:3004/health  # Notification Service
```

## 🔧 Individual Service Commands

### Build Individual Services
```bash
# Build user service
docker build -t ecommerce-user-service ./apps/user-service

# Build product service
docker build -t ecommerce-product-service ./apps/product-service

# Build order service
docker build -t ecommerce-order-service ./apps/order-service

# Build notification service
docker build -t ecommerce-notification-service ./apps/notification-service
```

### Run Individual Services
```bash
# Run user service
docker run -p 3002:3002 ecommerce-user-service

# Run product service
docker run -p 3001:3001 ecommerce-product-service

# Run order service (needs other services)
docker run -p 3003:3003 \
  -e USER_SERVICE_URL=http://host.docker.internal:3002 \
  -e PRODUCT_SERVICE_URL=http://host.docker.internal:3001 \
  ecommerce-order-service

# Run notification service (needs other services)
docker run -p 3004:3004 \
  -e USER_SERVICE_URL=http://host.docker.internal:3002 \
  -e ORDER_SERVICE_URL=http://host.docker.internal:3003 \
  -e PRODUCT_SERVICE_URL=http://host.docker.internal:3001 \
  ecommerce-notification-service
```

## 📊 Docker Compose Services

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  User Service   │
│   Port: 80      │────│  Port: 3002     │
└─────────────────┘    └─────────────────┘
         │                       │
         ├───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│Product Service  │    │ Order Service   │    │Notification Svc │
│  Port: 3001     │    │  Port: 3003     │    │  Port: 3004     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Dependencies
- **User Service**: Independent (no dependencies)
- **Product Service**: Independent (no dependencies)
- **Order Service**: Depends on User + Product services
- **Notification Service**: Depends on all other services
- **Nginx**: Depends on all services (routing)

## 🧪 Testing Containerized Platform

### 1. Run Complete Platform Demo
```bash
# Start all services
docker-compose up -d

# Run the demo
node demo-complete-platform.js
```

### 2. Test Individual Endpoints
```bash
# Test through Nginx proxy
curl http://localhost/health
curl http://localhost/api/products
curl http://localhost/api/users/register -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Test direct service access
curl http://localhost:3001/health  # Product Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Order Service
curl http://localhost:3004/health  # Notification Service
```

### 3. Test Notification System
```bash
# Run notification test
node test-notifications.js
```

## 🔍 Docker Commands Reference

### Container Management
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View container logs
docker logs <container_name>

# Execute command in running container
docker exec -it <container_name> /bin/sh

# Remove all containers
docker container prune

# Remove all images
docker image prune -a
```

### Image Management
```bash
# List images
docker images

# Remove specific image
docker rmi <image_name>

# Build without cache
docker build --no-cache -t <image_name> .

# Tag image for registry
docker tag <image_name> <registry>/<image_name>:<tag>
```

### Volume Management
```bash
# List volumes
docker volume ls

# Remove unused volumes
docker volume prune

# Inspect volume
docker volume inspect <volume_name>
```

## 🏗️ Dockerfile Best Practices

### 1. **Multi-stage Builds** (for production)
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
USER nodejs
EXPOSE 3000
CMD ["npm", "start"]
```

### 2. **Security Best Practices**
- Use non-root user
- Keep images small (Alpine Linux)
- Don't include secrets in images
- Use specific versions, not `latest`

### 3. **Performance Optimizations**
- Copy package.json first (better caching)
- Use `.dockerignore` to exclude unnecessary files
- Use multi-stage builds for smaller images
- Use health checks for better monitoring

## 🚀 Production Deployment

### 1. **Environment Variables**
```bash
# Create .env file
NODE_ENV=production
JWT_SECRET=your-super-secret-key
DATABASE_URL=postgresql://user:pass@db:5432/ecommerce
```

### 2. **Docker Compose Override**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  user-service:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - user-data:/app/data
```

### 3. **Deploy to Production**
```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔧 Troubleshooting

### Common Issues

#### 1. **Port Already in Use**
```bash
# Check what's using the port
lsof -i :3001
lsof -i :3002
lsof -i :3003
lsof -i :3004

# Kill the process
kill -9 <PID>
```

#### 2. **Container Won't Start**
```bash
# Check logs
docker-compose logs <service_name>

# Check container status
docker-compose ps

# Rebuild without cache
docker-compose build --no-cache
```

#### 3. **Services Can't Communicate**
```bash
# Check network
docker network ls
docker network inspect ecommerce-network

# Check service dependencies
docker-compose ps
```

#### 4. **Permission Issues**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Debug Commands
```bash
# Enter container shell
docker exec -it <container_name> /bin/sh

# Check container environment
docker exec <container_name> env

# Check container processes
docker exec <container_name> ps aux

# Check container network
docker exec <container_name> netstat -tulpn
```

## 📊 Monitoring and Logs

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs user-service

# Follow logs in real-time
docker-compose logs -f user-service

# Last 100 lines
docker-compose logs --tail=100 user-service
```

### Health Checks
```bash
# Check service health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health

# Check through Nginx
curl http://localhost/health
```

## 🎯 Next Steps

Once you're comfortable with Docker:

1. **Kubernetes**: Orchestrate containers at scale
2. **Docker Registry**: Store and share images
3. **CI/CD**: Automate building and deployment
4. **Monitoring**: Add observability tools
5. **Security**: Implement security scanning

## 🎉 Congratulations!

You now know how to:
- ✅ Containerize Node.js applications
- ✅ Use Docker Compose for orchestration
- ✅ Implement health checks and monitoring
- ✅ Follow Docker best practices
- ✅ Deploy microservices with Docker

This is exactly what companies like Netflix, Uber, and Amazon use to deploy their microservices! 🚀

---

*This Docker setup makes your e-commerce platform portable, scalable, and production-ready.*
