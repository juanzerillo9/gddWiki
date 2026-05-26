# Stage 1: Build
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package to CommonJS so the compiled API can require it at runtime
RUN pnpm --filter @wikigdd/shared build

# Generate Prisma client
RUN pnpm --filter @wikigdd/api db:generate

# Build API
RUN pnpm --filter @wikigdd/api build

# Stage 2: Production
FROM node:20-alpine AS runner

# openssl required by Prisma query engine
RUN apk add --no-cache openssl
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/prisma ./apps/api/prisma

# Install all deps (prisma CLI and tsx are devDeps but needed at container startup)
RUN pnpm install --frozen-lockfile

# Build shared package to CommonJS so Node can resolve @wikigdd/shared at runtime
RUN pnpm --filter @wikigdd/shared build

# Generate Prisma client in this environment
RUN pnpm --filter @wikigdd/api db:generate

# Copy compiled API output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node_modules/.bin/tsx prisma/seed.ts && node dist/apps/api/src/server.js"]
