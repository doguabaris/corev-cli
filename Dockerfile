# Dockerfile
FROM node:20-slim

WORKDIR /app

COPY . .

RUN npm install -g .

LABEL org.opencontainers.image.source="https://github.com/doguabaris/corev-cli"
LABEL org.opencontainers.image.description="Minimal CLI to manage versioned config files"
LABEL org.opencontainers.image.licenses="MIT"

ENTRYPOINT ["corev"]
