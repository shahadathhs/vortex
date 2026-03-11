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
# Runner stage (non-standalone)
# --------------------
FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

# Copy workspace config
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy web app (build output, config, public assets)
COPY --from=build /app/web/.next ./web/.next
COPY --from=build /app/web/public ./web/public
COPY --from=build /app/web/next.config.ts ./web/
COPY --from=build /app/web/package.json ./web/

# Copy node_modules for next start
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4000

CMD ["pnpm", "--filter", "@vortex/web", "start"]
