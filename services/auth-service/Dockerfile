# --------------------
# Build stage
# --------------------
FROM node:24-slim AS build

# Enable Corepack and Install PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Setup Apt Packages
RUN apt update && apt install -y

# Setup Working Directory
WORKDIR /app

# Copy Required Files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/auth-service ./services/auth-service
COPY packages ./packages

# Install Dependencies
RUN pnpm install --frozen-lockfile

# Build Application
RUN pnpm --filter auth-service... build

# --------------------
# Runner stage
# --------------------
FROM node:24-slim AS runner

# Setup Apt Packages
RUN apt update && apt install -y

# Setup Working Directory
WORKDIR /app

# Copy Built Files from Build Stage
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/services/auth-service ./services/auth-service

ENV NODE_ENV=production

CMD ["node", "services/auth-service/dist/index.js"]
