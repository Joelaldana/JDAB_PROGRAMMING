@echo off
chcp 65001 >nul
title JDAB PROGRAMING - Iniciando...
echo.
echo  ===== JDAB PROGRAMING =====
echo.
where python >nul 2>nul || (echo [ERROR] No encuentro Python. Instala Python 3.11 o 3.12 desde python.org y marca "Add to PATH". & pause & exit /b 1)
where npm >nul 2>nul || (echo [ERROR] No encuentro Node.js. Instalalo desde nodejs.org ^(version LTS^). & pause & exit /b 1)

cd /d "%~dp0backend"
if not exist .venv-local (
  echo [1/4] Creando entorno de Python ^(solo la primera vez^)...
  python -m venv .venv-local || (echo [ERROR] No se pudo crear el entorno & pause & exit /b 1)
)
call .venv-local\Scripts\activate.bat
echo [2/4] Instalando dependencias del servidor...
python -m pip install -q -r requirements-local.txt || (echo [ERROR] Fallo la instalacion & pause & exit /b 1)
if not exist .env (
  echo DATABASE_URL=sqlite:///./jdab_local.db> .env
  python -c "import secrets;print('SECRET_KEY='+secrets.token_urlsafe(48))">> .env
)
start "JDAB - Servidor (no cierres esta ventana)" cmd /k "cd /d %~dp0backend && call .venv-local\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

cd /d "%~dp0frontend"
if not exist node_modules (
  echo [3/4] Instalando dependencias del juego ^(solo la primera vez, puede tardar unos minutos^)...
  call npm install --no-audit --no-fund || (echo [ERROR] Fallo npm install & pause & exit /b 1)
)
echo [4/4] Abriendo el juego en http://localhost:5173
start "" http://localhost:5173
call npm run dev
