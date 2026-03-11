# --------------------
# Build stage
# --------------------
FROM node:24-slim AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web ./web

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @vortex/web build

# --------------------
# Runner stage (standalone)
# --------------------
FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

# Copy standalone output (structure: standalone/web/server.js)
COPY --from=build /app/web/.next/standalone ./
COPY --from=build /app/web/.next/static ./web/.next/static
COPY --from=build /app/web/public ./web/public

EXPOSE 4000

CMD ["node", "web/server.js"]
