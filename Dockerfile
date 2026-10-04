FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

COPY . .

RUN pnpm install --frozen-lockfile

ENV PORT=10000
ENV BASE_PATH=/

RUN pnpm --filter @workspace/hanh-trinh-dai-loan run build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

COPY --from=build /app/artifacts/hanh-trinh-dai-loan/dist/public ./public
COPY server.mjs ./server.mjs

EXPOSE 10000

CMD ["node", "server.mjs"]