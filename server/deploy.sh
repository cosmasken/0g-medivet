#!/bin/bash

echo "🚀 Deploying MediVet Server to Railway..."

# Login to Railway (interactive)
echo "Step 1: Login to Railway"
railway login

# Initialize project
echo "Step 2: Initialize Railway project"
railway init

# Deploy the application
echo "Step 3: Deploy to Railway"
railway up

echo "✅ Deployment complete!"
echo "Your server will be available at the Railway-provided URL"
