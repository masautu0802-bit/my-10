#!/bin/bash
# Next.js 16 has a bug with non-ASCII characters in the project path.
# This script syncs the project to an ASCII-only temp directory and runs the dev server there.

DEST="/tmp/my-10-dev"
SRC="$(cd "$(dirname "$0")" && pwd)"

echo "Syncing $SRC -> $DEST ..."
rsync -a --delete \
  --exclude='.git' \
  --exclude='.next' \
  --exclude='node_modules/.cache' \
  "$SRC/" "$DEST/"

cd "$DEST"
rm -rf .next

echo "Starting dev server at $DEST ..."
exec npx next dev --webpack
