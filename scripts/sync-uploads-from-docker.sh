#!/usr/bin/env sh
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
UPLOADS_DIR="$ROOT/uploads"
VOLUME="${COMPOSE_PROJECT_NAME:-syrianyothfoundation}_uploads_data"

mkdir -p "$UPLOADS_DIR/managers" "$UPLOADS_DIR/news"

if docker volume inspect "$VOLUME" >/dev/null 2>&1; then
  echo "Syncing uploads from Docker volume: $VOLUME"
  docker run --rm \
    -v "$VOLUME:/from:ro" \
    -v "$UPLOADS_DIR:/to" \
    alpine sh -c "cp -a /from/. /to/"
else
  echo "No Docker uploads volume found ($VOLUME). Using local ./uploads only."
fi
