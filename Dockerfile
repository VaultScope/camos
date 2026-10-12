# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Declare build-time environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npx vite build

# Production Stage
FROM nginx:alpine

RUN apk add --no-cache wget

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=20s \
    CMD wget --spider -q http://127.0.0.1:80 || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
