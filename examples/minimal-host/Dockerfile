# API-only image. The web bundle is built on the host (`npm run build:web`)
# and served by your reverse proxy out of ./dist, so this image stays small
# and the static files are easy to inspect or replace.
FROM node:22.13-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production \
    HOMESLATE_DATA_DIR=/data

# The lockfile makes builds reproducible. It also means `dist/` and any local
# `data/` are never needed here — only package.json and src/.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

VOLUME /data
EXPOSE 8787
CMD ["node", "src/server.mjs"]
