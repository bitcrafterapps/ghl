# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN apk add --no-cache python3 make g++
RUN pnpm install --frozen-lockfile --filter=three-bears-platform-backend

# Copy source code
COPY apps/backend ./apps/backend

# Build
WORKDIR /app/apps/backend
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm for production
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN apk add --no-cache python3 make g++
RUN pnpm install --frozen-lockfile --filter=three-bears-platform-backend --prod

# Copy built files
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/db ./apps/backend/db

WORKDIR /app/apps/backend

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health/ping || exit 1

# Start the server
CMD ["npm", "run", "start"]
