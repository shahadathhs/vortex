# --------------------
# Build stage
# --------------------
FROM node:24-slim AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/payment-service ./services/payment-service
COPY common ./common

RUN pnpm install --frozen-lockfile
RUN pnpm --filter payment-service... build

# --------------------
# Runner stage
# --------------------
FROM node:24-slim AS runner

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/common ./common
COPY --from=build /app/services/payment-service ./services/payment-service

ENV NODE_ENV=production

CMD ["node", "services/payment-service/dist/server.js"]
