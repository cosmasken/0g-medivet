# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Set build-time environment variables
# You will need to provide these in the 'deploy-vps.sh' script
ARG VITE_API_BASE_URL
ARG VITE_L1_RPC
ARG VITE_STANDARD_STORAGE_RPC
ARG VITE_TURBO_STORAGE_RPC
ARG VITE_PROJECT_ID

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_L1_RPC=$VITE_L1_RPC
ENV VITE_STANDARD_STORAGE_RPC=$VITE_STANDARD_STORAGE_RPC
ENV VITE_TURBO_STORAGE_RPC=$VITE_TURBO_STORAGE_RPC
ENV VITE_PROJECT_ID=$VITE_PROJECT_ID

# Build the application
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
