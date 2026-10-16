#!/bin/sh
# Container entrypoint: materialize the built web UI into the bind-mounted
# host directory if it's empty, then exec the API server.
#
# Why this dance? The Dockerfile bakes apps/reference/dist/ into the image
# at /opt/homeslate/web-baked. The compose file bind-mounts ./web (on the
# host) over /opt/homeslate/web. On first run, ./web is empty, so this
# script populates it. On subsequent runs, ./web already has the files
# (because it lives on the host) and we leave them alone — this lets the
# user edit, inspect, or replace them without rebuilding the image.
#
# After upgrading the image, the user re-runs:
#   bin/homeslate-update-web
# to refresh ./web from the new build.

set -eu

BAKED="/opt/homeslate/web-baked"
LIVE="/opt/homeslate/web"

if [ ! -d "$BAKED" ]; then
  echo "entrypoint: baked web dir $BAKED is missing — was the image built correctly?" >&2
  exit 1
fi

# The live dir is pre-created and owned by the runtime user. A bind
# mount from the host overlays it; on first run, the bind mount is
# empty, so we populate it from the baked copy. On subsequent runs
# the host already has the files and we leave them alone.
if [ ! -f "$LIVE/index.html" ]; then
  echo "entrypoint: populating $LIVE from baked image"
  cp -a "$BAKED/." "$LIVE/"
else
  echo "entrypoint: $LIVE already populated, leaving as-is"
fi

exec "$@"
