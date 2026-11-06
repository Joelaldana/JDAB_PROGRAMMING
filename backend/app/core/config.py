import secrets
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "JDAB PROGRAMING"
    VERSION: str = "1.1.0"
    API_V1_STR: str = "/api/v1"

    # NUNCA pongas credenciales reales aquí: defínelas en backend/.env (ver .env.example)
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/jdab_db"
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Zona horaria que define "un día" para la racha (Colombia)
    APP_TIMEZONE: str = "America/Bogota"

    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
    # También se permite la red local (192.168.x.x, 10.x.x.x) para jugar desde otros equipos del aula
    CORS_ORIGIN_REGEX: str = r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()

if not settings.SECRET_KEY:
    # Clave aleatoria: segura, pero las sesiones se cierran al reiniciar. Define SECRET_KEY en .env.
    settings.SECRET_KEY = secrets.token_urlsafe(48)
    print("⚠️  SECRET_KEY no definida en .env: usando una clave temporal (las sesiones caducan al reiniciar).")
