#!/bin/bash

# Deploy RealEstate Platform to Kubernetes
set -e

DOCKERHUB_USER=${1:-yourusername}

echo "Deploying RealEstate Platform to Kubernetes..."
echo "Using DockerHub username: $DOCKERHUB_USER"

sed -i.bak "s|yourusername/|${DOCKERHUB_USER}/|g" api-deployment.yml client-deployment.yml
rm -f api-deployment.yml.bak client-deployment.yml.bak

echo "Creating namespace..."
kubectl apply -f namespace.yml

echo "Creating ConfigMaps and Secrets..."
kubectl apply -f configmap.yml
kubectl apply -f secrets.yml

echo "Deploying PostgreSQL StatefulSet..."
kubectl apply -f db-statefulset.yml

echo "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n realestate --timeout=120s

echo "Deploying API..."
kubectl apply -f api-deployment.yml
kubectl apply -f api-service.yml

echo "Deploying Client..."
kubectl apply -f client-deployment.yml
kubectl apply -f client-service.yml

echo "Configuring Ingress..."
kubectl apply -f ingress.yml

echo ""
echo "Deployment complete! Checking status..."
kubectl get all -n realestate

echo ""
echo "To check pod logs:"
echo "  kubectl logs -f deployment/api-deployment -n realestate"
echo "  kubectl logs -f deployment/client-deployment -n realestate"
