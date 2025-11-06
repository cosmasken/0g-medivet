#!/bin/bash

# MediVet Web VPS Deployment Script
# Run this on your VPS from within the 'web' directory.
# Prerequisites: Docker, Docker Compose, and a running Traefik network.

echo "🏥 Deploying MediVet Web to VPS..."

# Load environment variables from .env file
# This file should contain your VITE_ variables.
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "⚠️ Warning: .env file not found. The build may fail if required variables are not set."
fi

# Check for essential environment variables
echo "🔐 Checking environment variables..."
if [ -z "$VITE_API_BASE_URL" ]; then
  echo "❌ Error: VITE_API_BASE_URL is not set. This is required for the frontend to connect to the backend."
  exit 1
fi

# Build and deploy the frontend container
echo "🚀 Building and starting MediVet web container..."
docker compose build --no-cache
docker compose up -d

# Check the status of the container
echo "✅ Checking deployment status..."
docker logs medivet-web --tail 20

echo "🎉 MediVet web deployed!"
echo "🔧 Remember to replace 'your-frontend-domain.com' in docker-compose.yml with your actual domain."
echo "DNS for your domain must point to this VPS's IP address."