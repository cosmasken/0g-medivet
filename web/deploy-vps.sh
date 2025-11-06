#!/bin/bash

echo "🌐 Deploying MediVet Frontend to VPS..."

# Check if npm exists, if not install Node.js
if ! command -v npm &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the React app
echo "📦 Building React application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

# Create Dockerfile for production
echo "🐳 Creating production Dockerfile..."
cat > Dockerfile <<'EOF'
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx config
echo "⚙️ Creating nginx configuration..."
cat > nginx.conf <<'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to backend
    location /api/ {
        proxy_pass http://medivet:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Create docker-compose.yml
echo "🔧 Creating docker-compose configuration..."
cat > docker-compose.yml <<'EOF'
services:
  web:
    build: .
    container_name: medivet-web
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.medivet-web.rule=Host(`medivet-data.netlify.app`) || Host(`medivet.paymebro.xyz`)"
      - "traefik.http.routers.medivet-web.tls=true"
      - "traefik.http.routers.medivet-web.tls.certresolver=letsencrypt"
      - "traefik.http.services.medivet-web.loadbalancer.server.port=80"
    restart: unless-stopped

networks:
  proxy:
    external: true
EOF

echo "🚀 Building and starting MediVet frontend..."
docker compose up -d --build

echo "✅ Checking deployment status..."
sleep 5
docker logs medivet-web --tail 10

echo "🎉 MediVet frontend deployed!"
echo "📝 Frontend will be available at: https://medivet.paymebro.xyz"
echo "🔧 Make sure DNS points medivet.paymebro.xyz -> YOUR_VPS_IP"
