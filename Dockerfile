# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# Ensure public exists for standalone copy (Next.js may have no public folder)
RUN mkdir -p public

# Precheck stage: run lint and unit tests (use: docker build --target check -t ticketing-ui:check . && docker run --rm ticketing-ui:check)
FROM builder AS check
RUN npm run lint && npm run test

# Build the app (after check so we don't build if check fails when both are run)
FROM builder AS build
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
