#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p data public/uploads/library backups
if [ ! -f .env ]; then
  cp .env.example .env
  echo "먼저 .env 파일의 PUBLIC_URL, ADMIN_PASSWORD 등을 수정하세요."
  exit 1
fi
docker compose up -d --build
echo "IROOM online server started on 127.0.0.1:3000"
echo "Next: connect Caddy or Nginx and point your domain DNS to this server."
