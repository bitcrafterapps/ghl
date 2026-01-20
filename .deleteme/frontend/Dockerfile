# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN apk add --no-cache python3 make g++
RUN pnpm install --frozen-lockfile --filter=three-bears-platform-frontend

# Copy source code
COPY apps/frontend ./apps/frontend

# Build arguments - Railway passes these from service Variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL

# Make them available as environment variables for Next.js build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

# Build Next.js with standalone output
WORKDIR /app/apps/frontend
RUN echo "Building with NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" && pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
# PORT is set by Railway at runtime (typically 8080), don't hardcode

EXPOSE 3000
EXPOSE 8080

# Health check - Railway sets PORT dynamically, so we use a simple curl/wget with the PORT env var
# Using shell form to expand $PORT at runtime
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/ || exit 1

CMD ["node", "apps/frontend/server.js"]
