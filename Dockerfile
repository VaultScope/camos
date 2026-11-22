# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Declare build-time environment variables
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# Production Stage (non-root nginx on port 8080)
FROM nginxinc/nginx-unprivileged:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=20s \
    CMD wget --spider -q http://127.0.0.1:8080/ || exit 1

EXPOSE 8080
USER 101
CMD ["nginx", "-g", "daemon off;"]
