# Builder stage (build all system-apps and backend deps)
FROM node:20-bookworm-slim AS builder
WORKDIR /src

# Install tools required for native builds
RUN apt-get update && apt-get install -y python3 make g++ build-essential ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy repo into build context
COPY . .

# Build every system app (each app's build script copies dist -> ../../backend/apps/<app>)
RUN set -eux; \
    if [ -d system-apps ]; then \
    cd system-apps; \
    for d in */; do \
    if [ -f "$d/package.json" ]; then \
    (cd "$d" && npm ci && npm run build); \
    fi; \
    done; \
    cd ..; \
    fi

# Install backend deps
WORKDIR /src/backend
RUN npm ci --production

# Final runtime image
FROM node:20-bookworm-slim
WORKDIR /app

COPY --from=builder /src/backend /app
# copy built system apps (backend expects built apps in /app/apps)
COPY --from=builder /src/backend/apps /app/apps

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "index.js"]