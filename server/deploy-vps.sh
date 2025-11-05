#!/bin/bash

# MediVet Server VPS Deployment Script
# Run this on your VPS after setting up Docker/Traefik

echo "🏥 Deploying MediVet Server to VPS..."

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# 1. Create medivet database
echo "📊 Creating medivet_db database..."
docker exec -it postgres psql -U postgres -c "CREATE DATABASE medivet_db;" 2>/dev/null || echo "Database already exists"

# 2. Check environment variables
echo "🔐 Checking environment variables..."
if [ -z "$ZG_PRIVATE_KEY" ]; then
  echo "❌ ZG_PRIVATE_KEY not set"
  exit 1
fi
if [ -z "$ENCRYPTION_KEY" ]; then
  echo "❌ ENCRYPTION_KEY not set"
  exit 1
fi
if [ -z "$JWT_SECRET" ]; then
  echo "❌ JWT_SECRET not set"
  exit 1
fi
if [ -z "$CONTRACT_ADDRESS" ]; then
  echo "❌ CONTRACT_ADDRESS not set"
  exit 1
fi

# 3. Build and deploy
echo "🚀 Building and starting MediVet server..."
docker compose build --no-cache
docker compose up -d

# 4. Check status
echo "✅ Checking deployment status..."
docker logs medivet --tail 20

echo "🎉 MediVet server deployed!"
echo "📝 Server will be available at: https://medivet.paymebro.xyz"
echo "🔧 Make sure DNS points medivet.paymebro.xyz -> YOUR_VPS_IP"
