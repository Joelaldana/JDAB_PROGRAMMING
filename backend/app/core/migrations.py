"""Migraciones idempotentes que se ejecutan al arrancar (reemplaza tener que correr migrate_db.py a mano)."""
from sqlalchemy import text

POSTGRES_STATEMENTS = [
    # Columnas de personalización (por si la BD es anterior a estos campos)
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_skin VARCHAR(50) DEFAULT 'default'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_aura VARCHAR(50) DEFAULT 'none'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS pet_color VARCHAR(50) DEFAULT 'orange'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_achievements VARCHAR(200) DEFAULT ''",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio_signature VARCHAR(100)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0",
    # Inventario por código (la tienda actual no usa item_id)
    "ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS item_type VARCHAR(30)",
    "ALTER TABLE user_inventory ADD COLUMN IF NOT EXISTS item_code VARCHAR(50)",
    "ALTER TABLE user_inventory ALTER COLUMN item_id DROP NOT NULL",
    """DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_user_item_ownership') THEN
           ALTER TABLE user_inventory ADD CONSTRAINT uq_user_item_ownership UNIQUE (user_id, item_type, item_code);
         END IF; END $$""",
    """CREATE TABLE IF NOT EXISTS user_mission_progress (
         id SERIAL PRIMARY KEY,
         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
         lesson_id VARCHAR(50) NOT NULL,
         completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_id))""",
    """CREATE TABLE IF NOT EXISTS user_unlocked_achievements (
         id SERIAL PRIMARY KEY,
         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
         achievement_id VARCHAR(50) NOT NULL,
         unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id))""",
]


SQLITE_STATEMENTS = [
    "DROP TABLE IF EXISTS user_inventory",  # la tabla del modelo no sirve para la tienda por código
    """CREATE TABLE IF NOT EXISTS user_inventory (
         id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
         item_type VARCHAR(30), item_code VARCHAR(50), UNIQUE (user_id, item_type, item_code))""",
    """CREATE TABLE IF NOT EXISTS user_mission_progress (
         id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, lesson_id VARCHAR(50) NOT NULL,
         completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (user_id, lesson_id))""",
    """CREATE TABLE IF NOT EXISTS user_unlocked_achievements (
         id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, achievement_id VARCHAR(50) NOT NULL,
         unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE (user_id, achievement_id))""",
]


def _sqlite_migrate(engine) -> None:
    with engine.begin() as conn:
        # Solo se recrea el inventario si todavía tiene la forma antigua del modelo (sin item_code)
        cols = [r[1] for r in conn.execute(text("PRAGMA table_info(user_inventory)")).fetchall()]
        for stmt in SQLITE_STATEMENTS:
            if stmt.startswith("DROP") and "item_code" in cols:
                continue
            conn.execute(text(stmt))


def run_startup_migrations(engine) -> None:
    if engine.dialect.name == "sqlite":
        return _sqlite_migrate(engine)
    if engine.dialect.name != "postgresql":
        return
    with engine.begin() as conn:
        for stmt in POSTGRES_STATEMENTS:
            conn.execute(text(stmt))
