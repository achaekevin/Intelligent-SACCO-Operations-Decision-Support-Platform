FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

# ─── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ─── Development ──────────────────────────────────────────────────────────────
FROM base AS development
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p logs src/uploads/documents src/uploads/photos
EXPOSE 5000
CMD ["dumb-init", "node", "--experimental-specifier-resolution=node", "src/server.js"]

# ─── Production ───────────────────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p logs src/uploads/documents src/uploads/photos \
    && addgroup -g 1001 -S nodejs \
    && adduser -S sacco -u 1001 \
    && chown -R sacco:nodejs /app
USER sacco
EXPOSE 5000
CMD ["dumb-init", "node", "src/server.js"]
