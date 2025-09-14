#!/bin/bash

# Monitoring Stack Deployment Script
# Deploys Prometheus, Grafana, ELK stack to Kubernetes

set -e

echo "🚀 Deploying Monitoring Stack to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "Please ensure kubectl is configured and cluster is accessible"
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

# Create monitoring namespace
echo "📁 Creating monitoring namespace..."
kubectl apply -f kubernetes/monitoring/namespace.yaml

# Deploy Prometheus
echo "📊 Deploying Prometheus..."
kubectl apply -f kubernetes/monitoring/prometheus-deployment.yaml

# Deploy Grafana
echo "📈 Deploying Grafana..."
kubectl apply -f kubernetes/monitoring/grafana-deployment.yaml

# Deploy Elasticsearch
echo "🔍 Deploying Elasticsearch..."
kubectl apply -f kubernetes/monitoring/elasticsearch-deployment.yaml

# Deploy Kibana
echo "📋 Deploying Kibana..."
kubectl apply -f kubernetes/monitoring/kibana-deployment.yaml

# Deploy Fluentd
echo "📝 Deploying Fluentd..."
kubectl apply -f kubernetes/monitoring/fluentd-deployment.yaml

# Deploy Ingress
echo "🌐 Deploying Monitoring Ingress..."
kubectl apply -f kubernetes/monitoring/ingress.yaml

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n monitoring
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n monitoring
kubectl wait --for=condition=available --timeout=300s deployment/elasticsearch -n monitoring
kubectl wait --for=condition=available --timeout=300s deployment/kibana -n monitoring

# Wait for DaemonSet
echo "⏳ Waiting for Fluentd DaemonSet to be ready..."
kubectl wait --for=condition=available --timeout=300s daemonset/fluentd -n monitoring

# Show status
echo "✅ Monitoring stack deployment complete!"
echo ""
echo "📊 Pod Status:"
kubectl get pods -n monitoring
echo ""
echo "🌐 Services:"
kubectl get services -n monitoring
echo ""
echo "🔗 Ingress:"
kubectl get ingress -n monitoring
echo ""

# Port forwarding instructions
echo "🎉 Monitoring stack is ready!"
echo ""
echo "💡 To access the monitoring tools, use port-forward:"
echo "   Prometheus:  kubectl port-forward service/prometheus 9090:9090 -n monitoring"
echo "   Grafana:     kubectl port-forward service/grafana 3000:3000 -n monitoring"
echo "   Elasticsearch: kubectl port-forward service/elasticsearch 9200:9200 -n monitoring"
echo "   Kibana:      kubectl port-forward service/kibana 5601:5601 -n monitoring"
echo ""
echo "🔑 Grafana credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📊 Access URLs:"
echo "   Prometheus:  http://localhost:9090"
echo "   Grafana:     http://localhost:3000"
echo "   Elasticsearch: http://localhost:9200"
echo "   Kibana:      http://localhost:5601"
