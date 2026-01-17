FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS dependencies
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter auth-service build

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 vortex
USER vortex

COPY --from=builder --chown=vortex:nodejs /app/package.json ./package.json
COPY --from=builder --chown=vortex:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=vortex:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=vortex:nodejs /app/packages ./packages
COPY --from=builder --chown=vortex:nodejs /app/services/auth-service ./services/auth-service

ENV NODE_ENV=production
CMD ["node", "services/auth-service/dist/index.js"]
