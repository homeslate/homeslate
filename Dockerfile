# syntax=docker/dockerfile:1.7
#
# Runtime image for the homeslate reference app.
#
# This Dockerfile assumes the host has already produced the built
# artifacts:
#
#   pnpm -r --filter './packages/*' run build
#   pnpm --filter homeslate-reference run build:web
#
# It only runs `pnpm install` inside the image so that platform-specific
# native modules (e.g. esbuild for the runtime, sharp, etc.) are
# resolved for the container's Linux architecture. Doing the workspace
# package builds inside Docker runs into a 2GB V8 heap limit on `vp
# pack` that the host build doesn't hit.
#
# The build is driven by bin/homeslate-build, which runs the host-side
# prep and then invokes `docker build`.

ARG NODE_VERSION=22.13.1

FROM node:${NODE_VERSION}-bookworm-slim

# git is here so the workspace prepare script and any future hooks
# work for operators who shell into the container. ca-certificates
# for outbound HTTPS to Google and openrouteservice.
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# pnpm via standalone install. The image's bundled corepack is
# incompatible with the version pinned in packageManager (a known
# signature-verification bug in Node 22.13's corepack).
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
RUN npm install -g pnpm@10.11.1

# Run as a non-root user so a compromised node process cannot rewrite
# the sqlite file or the Google refresh-token store.
RUN groupadd --system --gid 1001 homeslate \
 && useradd  --system --uid 1001 --gid homeslate --create-home --shell /usr/sbin/nologin homeslate

ENV NODE_ENV=production \
    HOMESLATE_DATA_DIR=/data

WORKDIR /app

# Copy manifests and lockfile first so the install layer is cacheable.
# We intentionally do NOT copy the host's node_modules — Docker's Linux
# install will produce a fresh, platform-correct tree.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/reference/package.json ./apps/reference/package.json

# Fresh install for the container's Linux platform. The cache mount
# keeps pnpm's content-addressable store across rebuilds.
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Now copy the rest of the source. dist/ folders produced on the host
# for the workspace packages and the reference app are included.
COPY apps/reference ./apps/reference
COPY tsconfig.app.json tsconfig.json tsconfig.node.json ./
COPY docker-entrypoint.sh /usr/local/bin/homeslate-entrypoint.sh

# Strip folders that have no runtime purpose.
#   - docs, .changeset, .worktrees, scripts: build-time / dev tooling
#   - apps/reference/src/web: bundled into dist/ at build time
#   - packages/display, packages/editor, packages/widgets/src: only used
#     by the web bundle (which is already compiled into apps/reference/dist/)
RUN rm -rf /app/docs \
             /app/.changeset \
             /app/.worktrees \
             /app/scripts \
             /app/apps/reference/src/web \
             /app/packages/display \
             /app/packages/editor \
             /app/packages/widgets/src \
 && find /app -name "*.test.ts"  -type f -delete \
 && find /app -name "*.test.tsx" -type f -delete

# Pre-create the data volume path and the bind-mount target with the
# right ownership. /opt/homeslate/web gets the host bind-mount on
# compose up; the entrypoint populates it from the baked image.
RUN mkdir -p /data /opt/homeslate/web-baked /opt/homeslate/web && \
    chown -R homeslate:homeslate /data /opt/homeslate && \
    cp -r /app/apps/reference/dist/. /opt/homeslate/web-baked/ && \
    chmod 755 /usr/local/bin/homeslate-entrypoint.sh

VOLUME ["/data"]

WORKDIR /app/apps/reference

USER homeslate

EXPOSE 8787

# The Hono server binds to 127.0.0.1:8787; the host's Caddy reaches it
# via the published port.
ENTRYPOINT ["/usr/local/bin/homeslate-entrypoint.sh"]
CMD ["node", "--import", "tsx", "src/server/listen.ts"]
