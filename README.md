# JDAB PROGRAMING 🎮

Academia gamificada de programación (HTML, CSS y Python) para grados 6° a 11°.
**90 niveles** (30 por ruta), mascota de racha que evoluciona, personaje con skins y auras, tienda, ranking y logros.

- **Juego (frontend):** React + Vite + Tailwind → http://localhost:5173
- **Servidor (backend):** FastAPI → http://localhost:8000 (documentación interactiva en `/docs`)

---

## 🚀 Forma más fácil (recomendada para probar)

No necesitas instalar PostgreSQL: usa una base SQLite local.

**Requisitos (se instalan una sola vez):**
1. [Python 3.11 o 3.12](https://www.python.org/downloads/) — en Windows marca **"Add Python to PATH"**.
2. [Node.js LTS](https://nodejs.org/).

**Windows:** haz doble clic en **`INICIAR_WINDOWS.bat`**.
**Mac / Linux:** abre una terminal en esta carpeta y ejecuta `./iniciar.sh`.

La primera vez tarda unos minutos (instala dependencias). Luego se abre solo el navegador en
http://localhost:5173. Para detener el juego, cierra las ventanas del servidor.

> Si usas Python 3.14 y falla la instalación, instala Python 3.12: algunas librerías aún no tienen versión para 3.14.

---

## 🛠️ Forma manual (dos terminales)

**Terminal 1 — Servidor**
```bash
cd backend
python -m venv .venv-local
# Windows:  .venv-local\Scripts\activate        Mac/Linux:  source .venv-local/bin/activate
pip install -r requirements-local.txt
# Crea el archivo backend/.env con estas dos líneas:
#   DATABASE_URL=sqlite:///./jdab_local.db
#   SECRET_KEY=pon_aqui_un_texto_largo_y_aleatorio
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Juego**
```bash
cd frontend
npm install
npm run dev
```
Abre http://localhost:5173 → **Crear Cuenta** → ¡a jugar!

---

## 🐘 Con PostgreSQL (para el colegio / producción)

### Opción A: Docker (todo incluido)
1. Instala [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Crea un archivo **`.env`** junto a `docker-compose.yml`:
   ```
   SECRET_KEY=un_texto_largo_y_aleatorio
   DB_PASSWORD=una_clave_segura_para_la_base
   ```
   (Genera la clave con `python -c "import secrets; print(secrets.token_urlsafe(48))"`.)
3. `docker compose up --build` → juego en http://localhost:5173.

### Opción B: PostgreSQL instalado
1. Crea la base `jdab_db`.
2. En `backend/.env` (copia `backend/.env.example`):
   ```
   DATABASE_URL=postgresql+psycopg://postgres:TU_CLAVE@localhost:5432/jdab_db
   SECRET_KEY=un_texto_largo_y_aleatorio
   ```
3. `pip install -r requirements.txt` y arranca igual que en la forma manual.

Las tablas y migraciones se crean **solas** al arrancar el servidor.

---

## 🏫 Jugar desde otros computadores del aula

1. Conecta todos a la misma red Wi-Fi/LAN.
2. En el computador que ejecuta el juego, averigua su IP (Windows: `ipconfig` → "Dirección IPv4", ej. `192.168.1.20`).
3. Permite los puertos **5173** y **8000** en el firewall de Windows si te lo pide.
4. Los estudiantes abren `http://192.168.1.20:5173` (el servidor ya acepta redes locales 192.168.x.x y 10.x.x.x).

---

## 🐍 Notas sobre los niveles de Python

La primera vez que se abre un nivel de Python se descarga el intérprete real (~10 MB, solo requiere internet esa vez por navegador).
Con él, el botón **▶ Ejecutar** corre código Python de verdad (`if`, `for`, funciones, listas…) y muestra errores con su línea.
**Sin internet** se usa una consola simulada que solo entiende `print` y variables simples.

El servidor **revisa el código** de cada misión antes de dar monedas/XP; ya no se puede hacer trampa enviando recompensas falsas.

---

## ✅ Pruebas automáticas

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```
Comprueban misiones, tienda, racha, ranking y que los 90 niveles se pueden superar.

---

## 🧯 Problemas frecuentes

| Síntoma | Solución |
|---|---|
| "No se pudo conectar al servidor" | El servidor (puerto 8000) no está corriendo. Revisa la ventana/terminal 1. |
| `ModuleNotFoundError` | Activa el entorno (`.venv-local`) y repite `pip install -r requirements-local.txt`. |
| Puerto 5173 u 8000 ocupado | Cierra el otro programa, o cambia el puerto (`--port 8001`; el juego busca la API en el 8000). |
| Todos pierden la sesión al reiniciar | Define `SECRET_KEY` en `backend/.env` (los scripts ya lo hacen). |
| El nivel de Python dice "Sin conexión" | Es solo la consola simulada: conéctate a internet una vez para descargar Python. |
| Quiero empezar de cero | Borra `backend/jdab_local.db` (modo fácil) y reinicia. |

## 🔐 Antes de usarlo con estudiantes reales
- Define una `SECRET_KEY` propia y una contraseña de base de datos nueva (**nunca** las subas a GitHub; `.gitignore` ya excluye `.env`).
- Si la contraseña anterior estuvo en un repositorio público, cámbiala.
- Sirve el juego por HTTPS si lo publicas en internet.
