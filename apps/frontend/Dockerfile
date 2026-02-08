# Production Dockerfile for SolidJS frontend
# Multi-stage build: Node for build, Nginx for serving

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# Copy source and build
COPY . .

# Build args for environment variables at build time
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN yarn build

# Runtime stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config as template (envsubst fills PROXY_BACKEND_URL at startup)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

ENV PROXY_BACKEND_URL=http://localhost:8080

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '${PROXY_BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
