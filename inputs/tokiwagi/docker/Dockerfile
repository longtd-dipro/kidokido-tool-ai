# Install dependencies only when needed
FROM node:20-bookworm-slim AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why might be needed.
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Enable corepack so the correct Yarn Berry version is used (yarn.lock is v9 / Yarn 4.x)
RUN corepack enable

WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies with cache mounted to speed up future builds
# This is a key optimization that prevents re-downloading dependencies on every build
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn \
  yarn install --immutable

# Rebuild the source code only when needed
FROM node:20-bookworm-slim AS builder
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

# Copy only necessary files for build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json yarn.lock ./
COPY prisma ./prisma/
COPY public ./public/
COPY src ./src/
COPY .env next.config.js tsconfig.json ./
COPY postcss.config.js tailwind.config.js ./

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
# Use development mode for the build to ensure CSS processing works correctly
#ENV NODE_ENV development
ENV NODE_OPTIONS=--max-old-space-size=4096

# Generate Prisma client - only needs to happen once
RUN yarn run prisma generate

# Run migrations in a separate step
RUN yarn run prisma migrate deploy

# Build application
RUN yarn build

# Production image, copy only necessary files
FROM node:20-bookworm-slim AS runner
RUN apt-get update && apt-get install -y \
  openssl \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_OPTIONS=--max-old-space-size=4096

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/server.js ./src/server.js
COPY --from=builder /app/src/utils/logger-custom-server.js ./src/utils/logger-custom-server.js
COPY --from=builder /app/src/utils/bigint.js ./src/utils/bigint.js

EXPOSE 3000
ENV PORT 3000

CMD ["yarn", "start"]
