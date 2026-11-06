#!/usr/bin/env bash
# Inicia JDAB PROGRAMING en Mac/Linux (modo fácil con SQLite, sin instalar PostgreSQL)
set -e
cd "$(dirname "$0")"
command -v python3 >/dev/null || { echo "Instala Python 3.11 o 3.12"; exit 1; }
command -v npm >/dev/null || { echo "Instala Node.js LTS (nodejs.org)"; exit 1; }

cd backend
[ -d .venv-local ] || python3 -m venv .venv-local
source .venv-local/bin/activate
pip install -q -r requirements-local.txt
if [ ! -f .env ]; then
  echo "DATABASE_URL=sqlite:///./jdab_local.db" > .env
  python -c "import secrets;print('SECRET_KEY='+secrets.token_urlsafe(48))" >> .env
fi
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
API_PID=$!
trap "kill $API_PID 2>/dev/null" EXIT

cd ../frontend
[ -d node_modules ] || npm install --no-audit --no-fund
echo "➜ Abre http://localhost:5173"
npm run dev
