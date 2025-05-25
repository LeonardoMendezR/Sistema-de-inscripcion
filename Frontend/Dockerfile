# syntax=docker/dockerfile:1
# Dockerfile para Frontend Next.js
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile || npm install
RUN pnpm build || npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=build /app .
EXPOSE 3000
CMD ["npm", "start"]
