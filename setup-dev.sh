#!/bin/bash

# MediVet Development Setup Script
echo "🏥 Setting up MediVet development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Setup web application
echo "📱 Setting up web application..."
cd web
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created web/.env from example - please configure your settings"
fi
npm install
echo "✅ Web setup complete"
cd ..

# Setup server
echo "🖥️  Setting up server..."
cd server
if [ ! -f .env ]; then
    echo "📝 Please create server/.env with your 0G private key and configuration"
    echo "   Required: ZG_PRIVATE_KEY, ZG_RPC_ENDPOINT"
fi
npm install
echo "✅ Server setup complete"
cd ..

# Android setup instructions
echo "📱 Android setup:"
echo "   1. Open Android Studio"
echo "   2. File > Open > select android directory"
echo "   3. Sync project with Gradle files"
echo "   4. Ensure Android API level 27+ and Health Connect APK"

echo ""
echo "🚀 Development environment ready!"
echo ""
echo "Next steps:"
echo "  1. Configure environment files (.env)"
echo "  2. Start web: cd web && npm run dev"
echo "  3. Start server: cd server && npm start"
echo "  4. Open Android project in Android Studio"
echo ""
echo "📚 See README.md for detailed instructions"
